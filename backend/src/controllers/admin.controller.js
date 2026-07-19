import asyncHandler from "express-async-handler";

export const verifyAdmin = asyncHandler(async (req, res) => {
  res.json({ success: true, authenticated: true });
});

