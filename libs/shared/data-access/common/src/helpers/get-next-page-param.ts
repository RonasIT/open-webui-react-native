export interface GetNextPageParamArgs<Item> {
  lastPage: Array<Item>;
  result: Array<Array<Item>>;
  lastPageParam: number;
  itemsPerPage: number;
}

export const getNextPageParam = <Item>({
  lastPage,
  result,
  lastPageParam,
  itemsPerPage,
}: GetNextPageParamArgs<Item>): number | undefined => {
  if (lastPage?.length === 0 || result[lastPageParam - 1].length < itemsPerPage) {
    return undefined;
  }

  return lastPageParam + 1;
};
