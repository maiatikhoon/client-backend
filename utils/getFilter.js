const getFilter = (req, arr) => {
  const searchString = req.query.search;

  //   console.log(searchString);
  const result = arr.map((ele) => {
    return { [ele]: { $regex: searchString, $options: "i" } };
  });

  //   console.log("result", result);
  return result;
};

module.exports = { getFilter };
