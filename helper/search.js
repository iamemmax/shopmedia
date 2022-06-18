exports.search = async (model, req, res) => {
  let { search, page = 1, limit = 50, order_by } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
      { localGovt: { $regex: search, $options: "i" } },
      { types: { $regex: search, $options: "i" } },
      { landmark: { $regex: search, $options: "i" } },
      { size: { $regex: search, $options: "i" } },
      { subTypes: { $regex: search, $options: "i" } },
      { interest: { $regex: search, $options: "i" } },
    ],
  };
  const results = await model
    .find(filterOptions)
    .select("-_id, -__v")
    .limit(limit * 1) //limit search result
    .skip((page - 1) * limit) // skip docs
    .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
  // count total posts
  const count = await model.countDocuments(filterOptions);
  // response
  res.status(200).json({
    count: results.length,
    page,
    totalPages: Math.ceil(count / limit),
    results: results,
  });
};





exports.filterPages = async (req, res, model) => {
  let { name, page = 1, limit = 50, order_by } = req.body;

  let { category } = req.params;

  const filterOptions = {
    $and: [
      {
        $or: [{ name: { $regex: name, $options: "i" } }],
      },
      {
        category: { $eq: category },
      },
    ],
  };

  const results = await model
    .find(filterOptions)
    .select("-_id, -__v")
    .limit(limit * 1) //limit search result
    .skip((page - 1) * limit) // skip docs
    .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
  // count total posts
  const count = await model.countDocuments(filterOptions);
  // response
  res.status(200).json({
    count: results.length,
    page,
    totalPages: Math.ceil(count / limit),
    results: results,
  });
};
