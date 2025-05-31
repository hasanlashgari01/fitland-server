const generatePagination = (page, limit, total, resourceName) => ({
    page: +page,
    limit: +limit,
    totalPage: Math.ceil(total / limit),
    ["total" + resourceName]: total,
});

module.exports = { generatePagination };
