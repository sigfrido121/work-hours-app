import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
    },
    morning: {
        start: { type: String, default: '08:00' },
        end: { type: String, default: '12:00' },
        enabled: { type: Boolean, default: true },
    },
    afternoon: {
        start: { type: String, default: '14:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true },
    },
    note: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
