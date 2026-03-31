import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    morning: {
        start:   { type: String, default: '08:00' },
        end:     { type: String, default: '12:00' },
        enabled: { type: Boolean, default: true },
    },
    afternoon: {
        start:   { type: String, default: '14:00' },
        end:     { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true },
    },
    note: { type: String, default: '' },
}, { timestamps: true });

// Each user can only have one entry per day
EntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
