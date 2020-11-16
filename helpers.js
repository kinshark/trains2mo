module.exports = {
    validateTime: (arrivalTime) => {
        arrivalTime.forEach(i => {
            if (!(parseInt(i.hour) >= 0 && parseInt(i.hour) <= 24 && parseInt(i.min) >= 0 && parseInt(i.min) <= 59)) {
                return false;
            }
        })
        return true;
    },
    getTime: bottleneck => {
        if (bottleneck && bottleneck[0])
            return bottleneck[0].HOUR >= 12 && (bottleneck[0].HOUR-12 || 12) + ':' + bottleneck[0].MIN + ' PM'
            || (Number(bottleneck[0].HOUR) || 12) + ':' + bottleneck[0].MIN + ' AM'
    }
}
