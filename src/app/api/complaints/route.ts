import { WebSocket } from "ws";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Complaint from "@/app/models/Complaint";

export async function GET(request: NextRequest) {
  try {
    const db = await dbConnect();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Get studentId from query params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    console.log(studentId);

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Find complaints for the specific student
    const complaints = await Complaint.find({ studentId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(complaints);
  } catch (error: any) {
    console.error("GET complaints error:", error);
    const statusCode = error.name === "MongooseError" ? 503 : 500;
    return NextResponse.json(
      {
        message: "Failed to fetch complaints",
        error: error.name,
        details: error.message,
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await dbConnect();
    if (!db) {
      throw new Error("Database connection failed");
    }

    const body = await request.json();
    const { studentId, complaintType, description, status = "open" } = body;

    // Validate required fields
    const validationErrors = [];

    if (!studentId) {
      validationErrors.push("Student ID is required");
    }

    if (!complaintType) {
      validationErrors.push("Complaint type is required");
    } else if (
      ![
        "bullying",
        "cafeteria",
        "grade",
        "academic",
        "technical",
        "administrative",
        "facility",
        "other",
      ].includes(complaintType)
    ) {
      validationErrors.push("Invalid complaint type");
    }

    if (!description) {
      validationErrors.push("Description is required");
    } else if (description.length < 10) {
      validationErrors.push("Description must be at least 10 characters long");
    } else if (description.length > 1000) {
      validationErrors.push("Description cannot exceed 1000 characters");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Create new complaint
    const complaint = await Complaint.create({
      studentId,
      complaintType,
      description,
      status,
    });

    // Notify all connected WebSocket clients
    if (global._clients) {
      const message = JSON.stringify({
        type: "ticket-created",
        data: complaint,
      });

      global._clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    console.error("POST complaint error:", error);
    const statusCode = error.name === "MongooseError" ? 503 : 500;
    return NextResponse.json(
      {
        message: "Failed to create complaint",
        error: error.name,
        details: error.message,
      },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await dbConnect();
    if (!db) {
      throw new Error("Database connection failed");
    }

    const body = await request.json();
    console.log("Received PUT request body:", body);

    const { id, complaintType, description, status } = body;

    // Validate required fields
    const validationErrors = [];

    if (!id) {
      validationErrors.push("Ticket ID is required");
    }

    if (!complaintType) {
      validationErrors.push("Complaint type is required");
    } else if (
      ![
        "bullying",
        "cafeteria",
        "grade",
        "academic",
        "technical",
        "administrative",
        "facility",
        "other",
      ].includes(complaintType)
    ) {
      validationErrors.push("Invalid complaint type");
    }

    if (!description) {
      validationErrors.push("Description is required");
    } else if (description.length < 10) {
      validationErrors.push("Description must be at least 10 characters long");
    } else if (description.length > 1000) {
      validationErrors.push("Description cannot exceed 1000 characters");
    }

    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors);
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    console.log("Finding complaint with ID:", id);

    // First check if the complaint exists
    const existingComplaint = await Complaint.findById(id);
    if (!existingComplaint) {
      console.log("Complaint not found");
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Update the complaint
    const updateData = {
      complaintType,
      description,
      status: status || "open",
      updatedAt: new Date(),
    };

    console.log("Updating complaint with data:", updateData);

    const updatedComplaint = await Complaint.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
      useFindAndModify: false, // Use native findOneAndUpdate
    });

    console.log("Updated complaint:", updatedComplaint);

    if (!updatedComplaint) {
      return NextResponse.json(
        { message: "Failed to update ticket" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedComplaint);
  } catch (error: any) {
    console.error("PUT complaint error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          message: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        {
          message: "Invalid ticket ID format",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to update complaint",
        error: error.name,
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Complaint ID is required" },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return NextResponse.json(
        { message: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Complaint deleted successfully" });
  } catch (error: any) {
    console.error("DELETE complaint error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete complaint",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
