const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { v4 } = require("uuid");
const getcoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "엠파이어 스테이트 빌딩",
    description: "세상에서 가장 높은 빌딩임",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th st, new york, NY 10001",
    creator: "u1",
  },
  {
    id: "p12",
    title: "엠파이어 스테이트 빌딩2",
    description: "세상에서 가장 높은 빌딩임",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th st, new york, NY 10001",
    creator: "u1",
  },
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("장소를 찾을 수 없습니다.", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "could not find a place for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError("장소 가져오기에 실패 했습니다.", 500);
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    const error = new HttpError(
      "could not find a places for the provided id.",
      404
    );
    return next(error);
  }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please your data.", 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getcoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://cdn.pixabay.com/photo/2013/01/29/00/47/google-76517__340.png",
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "장소 생성에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "ID에 해당하는 사용자를 찾을 수 없습니다.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    await sess.startTransaction();
    await createPlace.save({ session: sess });
    user.places.push(createPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(err, 500);
    return next(error);
  }

  res.status(201).json({ place: createPlace });
};

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please your data.",
      422
    );
    return next(error);
  }

  const pid = req.params.pid;
  const { title, description } = req.body;

  let place;

  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError("장소를 업데이트 할 수 없습니다.", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("오류가 발생했습니다.", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  let place;
  try {
    place = await Place.findById(pid).populate("creator");
    console.log(place);
  } catch (err) {
    const error = new HttpError("오류가 발생했습니다.", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "ID에 해당하는 장소를 찾을 수 없습니다. 다시 시도해주세요.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    await sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("장소를 삭제할 수 없습니다.", 500);
    return next(error);
  }

  res.status(200).json({
    message: "삭제 성공",
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

//html test
