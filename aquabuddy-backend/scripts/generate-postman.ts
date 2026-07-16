/**
 * Postman Collection Generator
 *
 * Usage: npx tsx scripts/generate-postman.ts
 *
 * Fetches the OpenAPI spec from the running server and converts to Postman collection v2.1.
 */

const API_BASE = 'http://localhost:3001';

async function generatePostmanCollection() {
  console.log('Fetching OpenAPI spec...');
  const response = await fetch(`${API_BASE}/api/v1/docs.json`);
  const spec = await response.json();

  const collection = {
    info: {
      name: 'AquaBuddy E-Tech API',
      description: spec.info.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _exporter_id: 'aquabuddy',
    },
    auth: {
      type: 'apikey',
      apikey: [
        { key: 'in', value: 'cookie', type: 'string' },
        { key: 'key', value: 'access_token', type: 'string' },
      ],
    },
    variable: [
      { key: 'base_url', value: API_BASE, type: 'string' },
      { key: 'api_prefix', value: '/api/v1', type: 'string' },
    ],
    item: [] as any[],
  };

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const item = {
        name: `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Accept', value: 'application/json' },
          ],
          url: {
            raw: `{{base_url}}{{api_prefix}}${path}`,
            host: ['{{base_url}}'],
            path: ['{{api_prefix}}', ...path.split('/').filter(Boolean)],
          },
        },
      };

      if (details.requestBody?.content?.['application/json']?.schema) {
        const schema = details.requestBody.content['application/json'].schema;
        item.request.body = {
          mode: 'raw',
          raw: JSON.stringify(generateExampleFromSchema(schema), null, 2),
          options: { raw: { language: 'json' } },
        };
      }

      collection.item.push(item);
    }
  }

  const fs = await import('fs');
  fs.writeFileSync('postman_collection.json', JSON.stringify(collection, null, 2));
  console.log(`Generated postman_collection.json with ${collection.item.length} endpoints`);

  // Also generate Bruno collection
  const brunoDir = 'bruno_collection';
  if (!fs.existsSync(brunoDir)) fs.mkdirSync(brunoDir);

  const brunoMeta = {
    version: '1.0',
    name: 'AquaBuddy E-Tech API',
    type: 'collection',
  };
  fs.writeFileSync(`${brunoDir}/collection.json`, JSON.stringify(brunoMeta, null, 2));

  let index = 0;
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const endpointName = `${method.toUpperCase()}-${path.replace(/\//g, '_').replace(/\{/g, '').replace(/\}/g, '')}`;
      const brunoItem = {
        name: `${method.toUpperCase()} ${path}`,
        request: {
          url: `${API_BASE}/api/v1${path}`,
          method: method.toUpperCase(),
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          body: details.requestBody?.content?.['application/json']?.schema
            ? { mode: 'json', json: JSON.stringify(generateExampleFromSchema(details.requestBody.content['application/json'].schema), null, 2) }
            : { mode: 'none' },
        },
      };
      fs.writeFileSync(`${brunoDir}/${endpointName}.json`, JSON.stringify(brunoItem, null, 2));
      index++;
    }
  }
  console.log(`Generated ${index} Bruno collection files in ${brunoDir}/`);
}

function generateExampleFromSchema(schema: any): any {
  if (!schema || !schema.properties) return {};
  const example: any = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    const p = prop as any;
    if (p.example !== undefined) {
      example[key] = p.example;
    } else if (p.default !== undefined) {
      example[key] = p.default;
    } else if (p.type === 'string') {
      if (p.format === 'uuid') example[key] = '00000000-0000-0000-0000-000000000000';
      else if (p.format === 'email') example[key] = 'user@example.com';
      else if (p.enum) example[key] = p.enum[0];
      else example[key] = 'string';
    } else if (p.type === 'integer' || p.type === 'number') {
      example[key] = p.enum ? p.enum[0] : 0;
    } else if (p.type === 'boolean') {
      example[key] = false;
    } else if (p.type === 'object') {
      example[key] = {};
    }
  }
  return example;
}

generatePostmanCollection().catch(console.error);
