const Dev = require("../models/Dev");
const axios = require("axios");
const Yup = require("yup");
const parseStringAsArray = require("../utils/parseStringAsArray");
module.exports = {
  async index(req, res) {
    const devs = await Dev.find();
    return res.json(devs);
  },

  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;
    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const response = await axios.get(
        `http://api.github.com/users/${github_username}`
      );
      const techsArray = parseStringAsArray(techs);
      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };
      const { name = login, avatar_url, bio } = response.data;
      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      });
    }

    return res.json(dev);
  },

  async update(req, res) {
    const schema = Yup.object().shape({
      longitude: Yup.string().required(),
      latitude: Yup.string().required(),
      techs: Yup.array().required()
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validate is failure" });
    }

    const { id } = req.params;
    const { techs, longitude, latitude } = req.body;

    let dev = await Dev.findById(id);
    if (!dev) {
      return res.status(400).json({ error: "Dev not found" });
    }
    const techsArray = parseStringAsArray(techs);

    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    };

    dev = await Dev.findByIdAndUpdate(
      id,
      { location, techs: techsArray },
      { new: true }
    );

    return res.json(dev);
  },

  async destroy(req, res) {
    const { id } = req.params;
    await Dev.findByIdAndDelete(id);
    return res.status(200);
  }
};
