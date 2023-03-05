const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { v4 } = require("uuid");
const getcoordsForAddress = require("../util/location");
const Place = require("../models/place");

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

  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("장소 가져오기에 실패 했습니다.", 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    const error = new HttpError(
      "could not find a places for the provided id.",
      404
    );
    return next(error);
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
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

  try {
    console.log("asdads");
    await createPlace.save();
  } catch (err) {
    const error = new HttpError(err, 500);
    return next(error);
  }

  res.status(201).json({ place: createPlace });
};

const updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please your data.", 422);
  }

  const pid = req.params.pid;
  const { title, description } = req.body;
  const updatePlace = {
    ...DUMMY_PLACES.find((p) => {
      return p.id === pid;
    }),
  };
  const placeIndex = DUMMY_PLACES.findIndex((p) => pid === p.id);

  updatePlace.title = title;
  updatePlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).json({ place: updatePlace });
};

const deletePlace = (req, res, next) => {
  const pid = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== pid);

  if (!DUMMY_PLACES.find((p) => pid === p.id)) {
    throw new HttpError("Could not find a place for that id", 404);
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
