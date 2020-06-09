
function getNowDate(): string {
    const date = new Date();
    const now = date.toJSON().slice(0, 10);
    return now.concat(' 00:00:00+00:00');
}

export {
    getNowDate as getNowDate,
};
