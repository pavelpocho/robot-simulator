
import vector from './vector';
import { add, cos, inv, matrix, multiply, sin } from 'mathjs';

export {}

onmessage = (ev: MessageEvent<number>) => {
  const data = ev.data;
  console.log("Got message");
}