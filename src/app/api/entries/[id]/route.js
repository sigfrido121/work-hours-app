import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

function validateEntryBody(body) {
    const errors = [];
    
    if (!body.date) {
        errors.push('La fecha es requerida');
    }
    
    if (body.morning?.enabled) {
        if (!body.morning.start || !body.morning.end) {
            errors.push('Los horarios de mañana son requeridos cuando está habilitado');
        } else if (body.morning.start >= body.morning.end) {
            errors.push('La hora de salida de mañana debe ser posterior a la entrada');
        }
    }
    
    if (body.afternoon?.enabled) {
        if (!body.afternoon.start || !body.afternoon.end) {
            errors.push('Los horarios de tarde son requeridos cuando está habilitado');
        } else if (body.afternoon.start >= body.afternoon.end) {
            errors.push('La hora de salida de tarde debe ser posterior a la entrada');
        }
    }
    
    if (!body.morning?.enabled && !body.afternoon?.enabled) {
        errors.push('Debes habilitar al menos un turno');
    }
    
    return errors;
}

export async function PUT(request, { params }) {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }
    
    try {
        await dbConnect();
        const body = await request.json();
        
        const validationErrors = validateEntryBody(body);
        if (validationErrors.length > 0) {
            return NextResponse.json({ success: false, error: validationErrors.join(', ') }, { status: 400 });
        }
        
        if (body.date) {
            const date = new Date(body.date);
            date.setUTCHours(0, 0, 0, 0);
            body.date = date;
        }
        
        const entry = await Entry.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        
        if (!entry) {
            return NextResponse.json({ success: false, error: 'Entrada no encontrada' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }
    
    try {
        await dbConnect();
        const deletedEntry = await Entry.deleteOne({ _id: id });
        
        if (deletedEntry.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Entrada no encontrada' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
