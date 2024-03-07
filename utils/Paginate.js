const paginate = async (req, res) => {
  const pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 1;

  console.log(">>>>>>>>");
  console.log(pageNo);
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  console.log(limit);

  const skip = (pageNo - 1) * limit;
  console.log(skip);

  const data = { pageNo: pageNo, limit: limit, skip: skip };

  return { limit: limit, skip: skip };
};

module.exports = { paginate };
