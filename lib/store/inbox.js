module.exports = (state, emitter) => {
    state.inbox = [];

    emitter.on('DOMContentLoaded', () => {
        try {
            state.inbox = JSON.parse(localStorage.getItem('inbox'));
            onSourcesChange();
        } catch (e) {}
    });

    emitter.on('source-added', onSourcesChange);
    emitter.on('source-removed', onSourcesChange);

    function onSourcesChange() {
        state.inbox = [].concat(
            ...state.sources.filter(s => s.feed).map(s => s.feed.items)
        );

        let uniqueGuids = [];
        state.inbox
            .sort(function(a, b) {
                return (
                    new Date(b.pubdate || b.pubDate) -
                    new Date(a.pubdate || a.pubDate)
                );
            })
            .reduce(function(newArray, singleItem) {
                if (uniqueGuids.includes(singleItem.guid)) {
                    return newArray;
                }
                uniqueGuids.push(singleItem.guid);
                return newArray.concat(singleItem);
            }, []);
        localStorage.setItem('inbox', JSON.stringify(state.inbox));
        emitter.emit('render');
    }
};
