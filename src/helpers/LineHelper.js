export class LineHelper {
    static checkIfBetweenTwoPoints({
        value,
        firstLimit,
        secondLimit,
        accuracy,
    }) {
        var min = Math.min(firstLimit, secondLimit) - accuracy,
            max = Math.max(firstLimit, secondLimit) + accuracy;
        return value > min && value < max;
    }
    static createLineFunction({ x0, x1, y0, y1 }) {
        return function (x) {
            let m = (y1 - y0) / (x1 - x0);
            return m * (x - x0) + y0;
        };
    }
    static subtractToValuesAbs(num1, num2) {
        var min = Math.min(num1, num2),
            max = Math.max(num1, num2);
        return Math.abs(max - min);
    }
    static checkIfInAccuracyRange({ comparedValue, baseValue, accuracy }) {
        const maxRange = baseValue + accuracy;
        const minRange = baseValue - accuracy;
        return comparedValue < maxRange && comparedValue > minRange;
    }
}
