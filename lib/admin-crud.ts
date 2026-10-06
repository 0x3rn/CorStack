import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, type JsonObject } from './db/neon';
import { verifyAdmin } from './admin';
import { apiError, assertSameOrigin, readJson } from './http';
import { documentId, parse } from './validation';

export function createCollectionHandlers(collection: string, schema: z.ZodType) {
  return {
    async POST(request: Request) {
      try {
        assertSameOrigin(request);
        await verifyAdmin(request);
        const body = parse(z.record(z.string(), z.unknown()), await readJson(request));
        if (body.order === undefined) body.order = (await db.collection(collection).get()).size;
        const data = parse(schema, body) as JsonObject;
        const doc = await db.collection(collection).add(data);
        return NextResponse.json({ ...data, id: doc.id }, { status: 201 });
      } catch (error) { return apiError(error); }
    },
    async PUT(request: Request) {
      try {
        assertSameOrigin(request);
        await verifyAdmin(request);
        const body = parse(z.record(z.string(), z.unknown()), await readJson(request));
        const id = parse(documentId, body.id);
        const { id: _id, ...fields } = body;
        void _id;
        const data = parse(schema, fields) as JsonObject;
        await db.collection(collection).doc(id).update(data);
        return NextResponse.json({ success: true });
      } catch (error) { return apiError(error); }
    },
    async DELETE(request: Request) {
      try {
        assertSameOrigin(request);
        await verifyAdmin(request);
        const id = parse(documentId, new URL(request.url).searchParams.get('id'));
        await db.collection(collection).doc(id).delete();
        return NextResponse.json({ success: true });
      } catch (error) { return apiError(error); }
    },
  };
}
