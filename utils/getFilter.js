const getFilter = (req, res) => {
  const searchString = req.query.search;

  //   console.log(searchString);

  return { searchString: searchString };
};

module.exports = { getFilter };
