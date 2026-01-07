export abstract class Serializable<TRow, TDto> {
  abstract serialize(row: TRow): TDto;

  serialize_multiple(rows: TRow[]): TDto[] {
    return rows.map(row => this.serialize(row));
  }
}
