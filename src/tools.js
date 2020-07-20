function cleanup(string, char = "-"){
    if(string)
        return string.replace(/[^a-zA-Z0-9]/g, char);
    return string
}

module.exports = {
    cleanup
}