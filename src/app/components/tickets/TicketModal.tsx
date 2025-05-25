"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ComplaintType, Ticket } from "@/app/types/ticket";

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Ticket>) => void;
    mode?: 'create' | 'edit';
    ticket?: Ticket;
}

interface FormErrors {
    type?: string;
    description?: string;
}

const complaintTypes: ComplaintType[] = [
    "bullying",
    "cafeteria",
    "grade",
    "academic",
    "technical",
    "administrative",
    "facility",
    "other"
];

export default function TicketModal({
    isOpen,
    onClose,
    onSubmit,
    mode = 'create',
    ticket
}: TicketModalProps) {
    const [type, setType] = useState<ComplaintType>("other");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (ticket && mode === 'edit') {
            setType(ticket.complaintType);
            setDescription(ticket.description);
        }
    }, [ticket, mode]);

    const validateForm = () => {
        const newErrors: FormErrors = {};
        
        if (!type) {
            newErrors.type = "Please select a complaint type";
        }
        
        if (!description) {
            newErrors.description = "Please provide a description";
        } else if (description.length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        } else if (description.length > 1000) {
            newErrors.description = "Description cannot exceed 1000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                ...ticket,
                complaintType: type,
                description
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create New Ticket' : 'Edit Ticket'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Complaint Type</label>
                        <Select
                            value={type}
                            onValueChange={(value: ComplaintType) => setType(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a complaint type" />
                            </SelectTrigger>
                            <SelectContent>
                                {complaintTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <p className="text-sm text-red-500">{errors.type}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Describe your complaint in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                        />
                        <p className="text-xs text-gray-500">
                            {description.length}/1000 characters
                        </p>
                        {errors.description && (
                            <p className="text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {mode === 'create' ? 'Create Ticket' : 'Update Ticket'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
