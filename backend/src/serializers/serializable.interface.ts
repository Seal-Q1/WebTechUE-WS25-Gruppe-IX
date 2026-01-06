export interface Serializable<TRow, TDto> {
  serialize(row: TRow): TDto;
  serialize_multiple(rows: TRow[]): TDto[];
}
