

const twitterURI = ( handle ) => `https://twitter.com/${handle.replace("@","")}`

const tweetURI = ({uri, text, tags, via}) => {
    return "https://twitter.com/intent/tweet?url=" + encodeURIComponent(uri) + "&text=" + encodeURIComponent(text) + "&hashtags=" + tags.join(",") + "&via=" + via;
}

export { tweetURI, twitterURI }