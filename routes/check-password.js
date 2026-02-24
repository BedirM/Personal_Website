export default function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { password } = req.body;

  const correctPassword = process.env.DRIVE_PASSWORD;

  if (password === correctPassword) {
    return res.status(200).json({
      success: true,
      driveUrl: process.env.DRIVE_URL
    });
  }

  return res.status(200).json({ success: false });
}