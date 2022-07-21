import { matrix, transpose } from "mathjs";

export default function vector(arr: number[]) {
  return transpose(matrix(arr));
}