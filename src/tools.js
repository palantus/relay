function cleanup(string){
    if(string)
        return string.replace(/[^a-zA-Z0-9]/g,'-');
    return string
}

module.exports = {
    cleanup
}