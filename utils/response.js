const { Prisma } = require("@prisma/client");

module.exports = {
  successRes(res, data) {
    res.status(200).json({ success: true, data });
  },
  errorRes(res, data, code) {
    if (data instanceof Error) {
      if (
        data instanceof Prisma.PrismaClientKnownRequestError ||
        data instanceof Prisma.PrismaClientValidationError
      ) {
        data = "Cannot process query";
      } else {
        data = data.message;
      }
    }
    res.status(code ? code : 400).json({ success: false, data });
  },
};
