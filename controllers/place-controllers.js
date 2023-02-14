const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { v4 } = require("uuid");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("could not find a place for the provided id.", 404);
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError("could not find a places for the provided id.", 404)
    );
  }
  res.json({ places });
};

const createPlace = (req, res, next) => {
  const error = validationResult(req);
  console.log(error);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please your data.", 422);
  }

  const { title, description, coordinates, address, creator } = req.body;

  const createPlace = {
    id: v4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createPlace);

  res.status(201).json({ place: createPlace });
};

const updatePlace = (req, res, next) => {
  const pid = req.params.pid;
  const { title, description, coordinates, address } = req.body;
  const updatePlace = {
    ...DUMMY_PLACES.find((p) => {
      return p.id === pid;
    }),
  };
  const placeIndex = DUMMY_PLACES.findIndex((p) => pid === p.id);

  updatePlace.title = title;
  updatePlace.description = description;
  updatePlace.location = coordinates;
  updatePlace.address = address;

  DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).json({ place: updatePlace });
};

const deletePlace = (req, res, next) => {
  const pid = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== pid);

  res.status(200).json({
    message: "삭제 성공",
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
