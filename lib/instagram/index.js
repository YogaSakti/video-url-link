const request = require('request');
const util = require('../util');

/**
 * Get instagram Info
 *
 * @param {string} url
 * @param {Object} options
 * @param {Function(Error, Object)} callback
 */
exports.getInfo = (url, options, callback) => {
    if (typeof options === 'function') callback = options, options = {};
    options = util.getReqOpt(options);
    options.url = url + "?__a=1";
    request(options, (err, res) => {
        if (err) return callback(err)
        try {
            const response = JSON.parse(res.body);
            if (response.hasOwnProperty('graphql')) {
                const type = response.graphql.shortcode_media.__typename;

                const metadata = {
                    type,
                    image: [],
                    video: []
                };

                if (type === 'GraphImage') {
                    metadata.image = response.graphql.shortcode_media.display_url;
                } else if (type === 'GraphVideo') {
                    metadata.video = {
                        thumbnail: response.graphql.shortcode_media.display_url,
                        videoUrl: response.graphql.shortcode_media.video_url
                    };
                } else if (type === 'GraphSidecar') {
                    response.graphql.shortcode_media.edge_sidecar_to_children.edges.map((item) => {
                        if (item.node.__typename == 'GraphImage') metadata.image.push(item.node.display_url);
                        if (item.node.__typename == 'GraphVideo') metadata.video.push({
                            thumbnail: item.node.display_url,
                            videoUrl: item.node.video_url
                        });
                    });
                };
                callback(null, metadata)
            } else {
                callback(new Error('User is Private or Post not Found'));
            }
        } catch (error) {
            callback(new Error(error));
        }

    });
}