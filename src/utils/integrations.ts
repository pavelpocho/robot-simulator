import { cos, sin } from "mathjs";

export const basicIntegrationTest = () => {

  // basicIntegration(Math.PI / 100);
  // basicIntegration(0.01);
  // basicIntegration(0.02);
  // fancyIntegrationOne(0.02);
  // fancyIntegrationTwo(0.02);
  // basicIntegration(0.001);
  // realWorldTestOne();
  realWorldTestTwo();

}

const fancyIntegrationTwo = (interval: number) => {
  var position = 0;
  var donePositionPart = 0;
  var frequency = 10;
  var doneSpeedPart = (interval / 3) * 0 - 1 / frequency;
  var speed = -1/frequency;
  var prevSpeed = 0;
  var prevPrevSpeed = 0;
  var acceleration = 0;
  var prevAcc = 0;
  var prevPrevAcc = 0;
  var max = -10000;
  var min = 10000;
  var totalDiff = 0;
  var maxTotalDiff = -10000;
  var minTotalDiff = 10000;
  var sumS = 0;
  for (let i = 0; i < 10000 / interval; i++) {
    acceleration = sin(i * interval * frequency);
    // console.log(`Acc: ${acceleration}`);
    // console.log(`Indiv: ${(acceleration - prevAcc) * interval / 2}`, `Sum: ${sumS}`);
    sumS += (acceleration - prevAcc) * interval / 2;
    if (i > 2) {
      doneSpeedPart += (interval / 3) * ((i % 2 == 1) ? 4 : 2) * prevPrevAcc;
    }

    if (i == 0) {
      speed = doneSpeedPart;
    }
    else if (i == 1) {
      speed = doneSpeedPart + ((interval / 3) * (acceleration));
    }
    else {
      speed = doneSpeedPart + ((interval / 3) * (4 * prevAcc + acceleration));
    }
    prevPrevAcc = prevAcc;
    prevAcc = acceleration;
    const preciseSpeed = -(1/frequency) * cos(i * interval * frequency);
    totalDiff += preciseSpeed - speed;
    maxTotalDiff = Math.max(maxTotalDiff, totalDiff);
    minTotalDiff = Math.min(minTotalDiff, totalDiff);
    if (i % 1000 == 0) {
      // console.log(`Indiv: ${(acceleration - prevAcc) * interval / 2}`, `Sum: ${sumS}`);
      // console.log(`FANCY: Speed: ${speed}`, `Cos: ${preciseSpeed}`, `Cumulative diff: ${totalDiff}`, `Min (max): ${minTotalDiff} (${maxTotalDiff})`);
    }
    // console.log(`Speed: ${speed}`);

    // position = position + speed * interval + acceleration * (1 / 2) * (interval ** 2);

    if (i > 2) {
      donePositionPart += (interval / 3) * ((i % 2 == 1) ? 4 : 2) * prevPrevSpeed;
    }

    if (i == 0) {
      position = donePositionPart;
    }
    else if (i == 1) {
      position = donePositionPart + ((interval / 3) * (speed));
    }
    else {
      position = donePositionPart + ((interval / 3) * (4 * prevSpeed + speed));
    }
    prevPrevSpeed = prevSpeed;
    prevSpeed = speed;

    max = Math.max(max, position);
    min = Math.min(min, position);
    // if (i % 1000 == 0) {
    //   console.log(`i: ${i}, Target: ${1000 / interval}, Percent: ${i / (1000 / interval) * 100}`);
    // }
  }
  console.log(`FANCY 2: Cumulative diff: ${totalDiff}`, `Min (max): ${minTotalDiff} (${maxTotalDiff})`);
  console.log(`Interval: ${interval}, position: ${position}, max: ${max}, min: ${min}`);
}

const fancyIntegrationOne = (interval: number) => {
  var position = 0;
  var frequency = 10;
  var speed = -1/frequency;
  var acceleration = 0;
  var prevAcc = 0;
  var max = -10000;
  var min = 10000;
  var totalDiff = 0;
  var maxTotalDiff = -10000;
  var minTotalDiff = 10000;
  var sumS = 0;
  for (let i = 0; i < 10000 / interval; i++) {
    acceleration = sin(i * interval * frequency);
    // console.log(`Acc: ${acceleration}`);
    // console.log(`Indiv: ${(acceleration - prevAcc) * interval / 2}`, `Sum: ${sumS}`);
    sumS += (acceleration - prevAcc) * interval / 2;
    speed = speed + (acceleration * interval) + ((acceleration - prevAcc) * interval / 2);
    prevAcc = acceleration;
    const preciseSpeed = -(1/frequency) * cos(i * interval * frequency);
    totalDiff += preciseSpeed - speed;
    maxTotalDiff = Math.max(maxTotalDiff, totalDiff);
    minTotalDiff = Math.min(minTotalDiff, totalDiff);
    if (i % 1000 == 0) {
      // console.log(`Indiv: ${(acceleration - prevAcc) * interval / 2}`, `Sum: ${sumS}`);
      // console.log(`FANCY: Speed: ${speed}`, `Cos: ${preciseSpeed}`, `Cumulative diff: ${totalDiff}`, `Min (max): ${minTotalDiff} (${maxTotalDiff})`);
    }
    // console.log(`Speed: ${speed}`);
    position = position + speed * interval + acceleration * (1 / 2) * (interval ** 2);
    max = Math.max(max, position);
    min = Math.min(min, position);
    // if (i % 1000 == 0) {
    //   console.log(`i: ${i}, Target: ${1000 / interval}, Percent: ${i / (1000 / interval) * 100}`);
    // }
  }
  console.log(`FANCY: Cumulative diff: ${totalDiff}`, `Min (max): ${minTotalDiff} (${maxTotalDiff})`);
  console.log(`Interval: ${interval}, position: ${position}, max: ${max}, min: ${min}`);
}

const basicIntegration = (interval: number) => {
  var position = 0;
  var frequency = 10;
  var speed = -1/frequency;
  var acceleration = 0;
  var max = -10000;
  var min = 10000;
  var totalDiff = 0;
  var maxTotalDiff = -10000;
  var minTotalDiff = 10000;
  for (let i = 0; i < 1000 / interval; i++) {
    acceleration = sin(i * interval * frequency);
    // console.log(`Acc: ${acceleration}`);
    speed = speed + acceleration * interval;
    const preciseSpeed = -(1/frequency) * cos(i * interval * frequency);
    totalDiff += preciseSpeed - speed;
    maxTotalDiff = Math.max(maxTotalDiff, totalDiff);
    minTotalDiff = Math.min(minTotalDiff, totalDiff);
    if (i % 1000 == 0) {
      // console.log(`BASIC: Speed: ${speed}`, `Cos: ${preciseSpeed}`, `Cumulative diff: ${totalDiff}`, `Min (max): ${minTotalDiff} (${maxTotalDiff})`);
    }
    // console.log(`Speed: ${speed}`);
    position = position + speed * interval + acceleration * (1 / 2) * (interval ** 2);
    max = Math.max(max, position);
    min = Math.min(min, position);
    // if (i % 1000 == 0) {
    //   console.log(`i: ${i}, Target: ${1000 / interval}, Percent: ${i / (1000 / interval) * 100}`);
    // }
  }
  console.log(`BASIC: Cumulative diff: ${totalDiff}`, `Min (max): ${minTotalDiff} (${maxTotalDiff})`);
  console.log(`Interval: ${interval}, position: ${position}, max: ${max}, min: ${min}`);
}

const realWorldTestOne = () => {
  var acceleration = 0;
  var prevAccel = 0;
  var speed = 0;
  var prevSpeed = 0;
  var position = 0;
  var interval = 0.001;
  for (var i = 0; i < 100000; i++) {
    acceleration = cos(position) * 9.81;
    speed += acceleration * interval;
    position += speed * interval + (1/2) * acceleration * (interval ** 2);
    if (i % 100 == 0) {
      console.log(speed);
    }
  }
}

const realWorldTestTwo = () => {
  var acceleration = 0;
  var prevAccel = 0;
  var speed = 0;
  var prevSpeed = 0;
  var position = 0;
  var interval = 0.001;
  for (var i = 0; i < 1500000; i++) {
    acceleration = cos(position) * 9.81;
    speed += interval * (acceleration + prevAccel) / 2;
    position += interval * (speed + prevSpeed) / 2;
    if (i % 1000 == 0) {
      console.log(speed);
    }
    prevAccel = acceleration;
    prevSpeed = speed;
  }
}