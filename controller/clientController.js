const Joi = require("joi");
const { getObjectUrl, uploadObject } = require("../utils/s3Bucket");
const MyClient = require("../model/clientModel");
const { paginate } = require("../utils/Paginate");
const { getFilter } = require("../utils/getFilter");

const getAllClient = async (req, res) => {
  try {
    const { pageNo, limit, skip } = await paginate(req);

    const search = req.query.search;

    const options = [
      "name",
      "code",
      "email",
      "website_link",
      "address",
      "state",
      "pincode",
      "organisation_type",
    ];

    const filter = await getFilter(req, options);

    if (search) {
      const data = await MyClient.find({
        $or: filter,
      })
        .skip(skip)
        .limit(limit);

      if (data.length > 0) {
        return res
          .status(200)
          .json({ data: data, page: pageNo, totalCounts: data.length });
      }
      return res.status(200).json({ data: data });
    } else {
      const data1 = await MyClient.find({}).skip(skip).limit(limit);
      const data = data1.reverse();
      if (data.length < 0) {
        return res.status(400).json({ messaage: "No Client Found" });
      }

      const response = await Promise.all(
        data.map(async (client) => {
          let newData = {};
          if (client.logo.length > 0) {
            const url = await getObjectUrl(client.logo[0].imageKey);
            newData = {
              ...JSON.parse(JSON.stringify(client)),
              url: url,
            };
            // return newData;
          }

          const myData = { ...JSON.parse(JSON.stringify(client)) };
          return { ...newData, ...myData };
        })
      );
      return res.status(200).json({ data: response });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getClientById = async (req, res) => {
  const _id = req.params.id;

  try {
    const client = await MyClient.findOne({ _id: _id });

    if (client) {
      return res.status(200).json({ data: client });
    } else {
      return res.status(400).json({ error: "client not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "client not found" });
  }
};

const createClient = async (req, res) => {
  try {
    const {
      name,
      code,
      email,
      contact,
      landline_number,
      website_link,
      address,
      state,
      city,
      pincode,
      organisation_type,
      userid,
    } = req.body;

    console.log("body ", req.body);
    const { error } = validateClientInput(req.body);

    const { logo } = req.files;

    console.log("before logo");
    console.log(logo);
    const logoArr = [];

    if (logo) {
      const [clientLogo] = logo;

      async function uploadClientLogo() {
        const s3Response = await uploadObject(
          `logo/${Date.now()}`,
          clientLogo.buffer,
          clientLogo.mimetype
        );

        logoArr.push({
          imageName: clientLogo.originalname,
          imageKey: s3Response["key"],
        });
      }

      await uploadClientLogo();
    }

    console.log("logoArr", logoArr);

    if (error) {
      console.log("error message >>>>>");
      let errorMessage = error.details[0].message;
      errorMessage = errorMessage.replace(/"/g, "");
      console.log(errorMessage);
      return res.status(400).json({ error: errorMessage });
    }

    const user = await MyClient.findOne({ email: email }).maxTimeMS(30000);

    console.log(">>>>>>>>>");
    console.log("user ", user);

    console.log(!user);

    if (!user) {
      const newClient = new MyClient({
        name,
        code,
        email,
        contact,
        landline_number,
        website_link,
        address,
        state,
        city,
        pincode,
        organisation_type,
        userid,
        logo: logoArr,
      });

      const savedUser = await newClient.save();

      console.log("savedUser", savedUser);
      return res.status(200).json({ message: "document created!" });
    } else {
      return res.status(400).json({ error: "Email already exits" });
    }
  } catch (error) {
    console.log("in catch part");
    console.log("error ", error);
    return res.status(500).json({ error: "Internal server error " });
  }
};

const updateClient = async (req, res) => {
  const id = req.params.id;

  try {
    const {
      name,
      code,
      email,
      contact,
      landline_number,
      website_link,
      address,
      state,
      city,
      pincode,
      organisation_type,
      userid,
    } = req.body;

    const { error } = validateUpdateClientInput(req.body);

    if (error) {
      let errorMessage = error.details[0].message;

      errorMessage = errorMessage.replace(/"/g, "");
      return res.status(400).json({ error: errorMessage });
    }

    const { logo } = req.files;
    const logoArr = [];

    console.log(">>>>>>>>");
    console.log("logo", logo);
    if (logo) {
      const [clientLogo] = logo;

      async function uploadClientLogo() {
        const s3Response = await uploadObject(
          `logo/${Date.now()}`,
          clientLogo.buffer,
          clientLogo.mimetype
        );

        logoArr.push({
          imageName: clientLogo.originalname,
          imageKey: s3Response["key"],
        });
      }

      await uploadClientLogo();
    }

    console.log("logoArr", logoArr);

    const user = await MyClient.findOne({ _id: id });
    console.log(user);

    const updatedData = {
      name: name ? name : user.name,
      code: code ? code : user.code,
      email: email ? email : user.email,
      contact: contact ? contact : user.contact,
      landline_number: landline_number ? landline_number : user.landline_number,
      website_link: website_link ? website_link : user.website_link,
      address: address ? address : user.address,
      state: state ? state : user.state,
      city: city ? city : user.city,
      pincode: pincode ? pincode : user.pincode,
      organisation_type: organisation_type
        ? organisation_type
        : user.organisation_type,
      userid: userid ? userid : user.userid,
      logo: logoArr.length > 0 ? logoArr : user.logo,
    };

    if (user) {
      const updatedClient = await MyClient.findByIdAndUpdate(
        { _id: id },
        updatedData,
        { new: true }
      );

      console.log(">>>>>>>>>>>>");
      console.log(updatedClient);

      return res.status(200).json({ data: updatedClient });
    } else {
      return res.status(400).json({ error: "Client not found! " });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteClient = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await MyClient.findByIdAndDelete({ _id: id });

    console.log(result);
    return res.status(200).json({ message: "document deleted !" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const validateClientInput = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(20).messages({
      "string.max": "name should of max 20 characters",
      "string.min": "name should be of atlest 3 characters",
    }),

    code: Joi.string().required(),
    email: Joi.string()
      .required()
      .email({ tlds: ["com", "in", "net"] })
      .messages({
        "string.email": "enter a valid email address",
      }),
    contact: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .messages({
        "string.length": "Contact number should contain 10 digits",
      })
      .required(),

    landline_number: Joi.string()
      .min(11)
      .max(15)
      .pattern(/^\d+$/)
      .required()
      .messages({
        "string.min": "Landline number must have at least {#limit} digits",
        "string.max": "Landline number must have at most {#limit} digits",
      }),
    website_link: Joi.string(),
    address: Joi.string().required().max(100).messages({
      "string.max": "address should of maximum 100 characters",
    }),

    state: Joi.string().required(),
    city: Joi.string(),
    pincode: Joi.number().required(),
    organisation_type: Joi.string().required(),
    userid: Joi.string(),
  });

  return schema.validate(data);
};

const validateUpdateClientInput = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(20)
      .messages({
        "string.max": "name should be of max 20 characters",
        "string.min": "name should be of atlest 3 characters",
      })
      .allow(""),

    code: Joi.string().allow(""),
    email: Joi.string()
      .email({ tlds: ["com", "in", "net"] })
      .messages({
        "string.email": "enter a valid email address",
      }),

    contact: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .messages({
        "string.length": "Contact number should contain 10 digits",
      })
      .allow(""),

    landline_number: Joi.string()
      .min(11)
      .max(15)
      .pattern(/^\d+$/)
      .required()
      .messages({
        "string.min": "Landline number must have at least {#limit} digits",
        "string.max": "Landline number must have at most {#limit} digits",
      })
      .allow(""),
    website_link: Joi.string().allow(""),
    address: Joi.string().max(100).messages({
      "string.max": "address should be of maximum 100 characters",
    }),

    state: Joi.string(),
    city: Joi.string(),
    pincode: Joi.number(),
    organisation_type: Joi.string(),
    userid: Joi.string().allow(""),
    logo: Joi.string().allow(""),
  });

  return schema.validate(data);
};
module.exports = {
  getAllClient,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
};
