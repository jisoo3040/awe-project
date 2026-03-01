export async function onRequest(context) {
  const table = context.params.table;
  const { DB } = context.env;

  if (context.request.method === "GET") {
    const { results } = await DB.prepare(`SELECT * FROM ${table}`).all();
    return Response.json(results);
  }

  if (context.request.method === "POST") {
    const body = await context.request.json();

    // 🔥 id 자동 생성
    body.id = crypto.randomUUID();

    const keys = Object.keys(body);
    const values = Object.values(body);

    const placeholders = keys.map(() => "?").join(",");

    await DB.prepare(
      `INSERT INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`
    )
      .bind(...values)
      .run();

    return new Response("Inserted", { status: 201 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
