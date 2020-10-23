function cleanup(string, replacementChar = "-"){
    if(string)
        return string.replace(/[^a-zA-Z0-9_]/g, replacementChar);
    return string
}

function cleanupChannelSearch(string){
    if(string)
        return string.replace(/[^a-zA-Z0-9_\^\/]/g, "-");
    return string
}

module.exports = {
    cleanup,
    cleanupChannelSearch
}