const Complaint = require("../models/Complaint");

// Create a new complaint
exports.createComplaint = async (req: { body: { studentId: any; complaintType: any; description: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; complaint?: { id: any; type: any; description: any; status: any; createdAt: any; }; error?: any; }): void; new(): any; }; }; }) => {
  try {
    const { studentId, complaintType, description } = req.body;

    if (!studentId || !complaintType || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newComplaint = new Complaint({
      studentId,
      complaintType,
      description,
      status: "open",
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: {
        id: newComplaint._id,
        type: newComplaint.complaintType,
        description: newComplaint.description,
        status: newComplaint.status,
        createdAt: newComplaint.createdAt,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

// Get all complaints
exports.getAllComplaints = async (_req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; error: any; }): void; new(): any; }; }; }) => {
  try {
    const complaints = await Complaint.find();
    const mappedComplaints = complaints.map((c: { _id: any; complaintType: any; description: any; status: any; createdAt: any; }) => ({
      id: c._id,
      type: c.complaintType,
      description: c.description,
      status: c.status,
      createdAt: c.createdAt,
    }));

    res.status(200).json(mappedComplaints);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};
