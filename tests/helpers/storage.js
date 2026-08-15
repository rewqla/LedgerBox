async function listStorageObjectNames(db, bucketId) {
  const result = await db.query(
    `
      select name
      from storage.objects
      where bucket_id = $1
      order by name
    `,
    [bucketId]
  );

  return result.rows.map((row) => row.name);
}

async function expectStorageObjects(db, bucketId, expectedNames) {
  const names = await listStorageObjectNames(db, bucketId);
  expect(names).toEqual(expectedNames);
}

module.exports = {
  expectStorageObjects,
  listStorageObjectNames
};
