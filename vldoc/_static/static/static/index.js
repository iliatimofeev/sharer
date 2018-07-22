import { text } from 'd3-fetch';
import { event, select, selectAll } from 'd3-selection';
// import * as hljs from 'highlight.js';
import * as vega from 'vega';
import { post } from 'vega-embed/build/post';
import { Handler } from 'vega-tooltip';
import { compile } from '../../src';
import { runStreamingExample } from './streaming';
// import {$} from 'jquery';
window['runStreamingExample'] = runStreamingExample;
window['embedExample'] = embedExample;
var BASEURL = 'https://vega.github.io/vega-lite/';
var loader = vega.loader({
    baseURL: BASEURL
});
var editorURL = 'https://vega.github.io/editor/';
/* Documentation */
function renderExample($target, specText) {
    $target.classed('example', true);
    $target.text('');
    var vis = $target.append('div').attr('class', 'example-vis');
    // Decrease visual noise by removing $schema and description from code examples.
    var textClean = specText.replace(/(\s)+\"(\$schema|description)\": \".*?\",/g, '');
    var code = $target.append('pre').attr('class', 'example-code')
        .append('code').attr('class', 'json').text(textClean);
    // hljs.highlightBlock(code.node() as any);
    var spec = JSON.parse(specText);
    embedExample(vis.node(), spec, true, !$target.classed('no-tooltip'));
}
export function embedExample($target, spec, actions, tooltip) {
    if (actions === void 0) { actions = true; }
    if (tooltip === void 0) { tooltip = true; }
    var vgSpec = compile(spec).spec;
    var view = new vega.View(vega.parse(vgSpec), { loader: loader })
        .renderer('svg')
        .initialize($target);
    if (tooltip) {
        var handler = new Handler().call;
        view.tooltip(handler);
    }
    view.run();
    if (actions) {
        select($target)
            .append('div')
            .attr('class', 'vega-actions')
            .append('a')
            .text('Open in Vega Editor')
            .attr('href', '#')
            .on('click', function () {
            post(window, editorURL, {
                mode: 'vega-lite',
                spec: JSON.stringify(spec, null, 2),
                config: vgSpec.config,
                renderer: 'svg'
            });
            event.preventDefault();
        });
    }
    return view;
}
function getSpec(el) {
    var sel = select(el);
    var name = sel.attr('data-name');
    if (name) {
        var dir = sel.attr('data-dir');
        var fullUrl = BASEURL + '/examples/specs/' + (dir ? (dir + '/') : '') + name + '.vl.json';
        text(fullUrl).then(function (spec) {
            renderExample(sel, spec);
        }).catch(console.error);
    }
    else {
        console.error('No "data-name" specified to import examples from');
    }
}
window['changeSpec'] = function (elId, newSpec) {
    var el = document.getElementById(elId);
    select(el).attr('data-name', newSpec);
    getSpec(el);
};
window['buildSpecOpts'] = function (id, baseName) {
    var oldName = select('#' + id).attr('data-name');
    var prefixSel = select('select[name=' + id + ']');
    var inputsSel = selectAll('input[name=' + id + ']:checked');
    var prefix = prefixSel.empty() ? id : prefixSel.property('value');
    var values = inputsSel.nodes().map(function (n) { return n.value; }).sort().join('_');
    var newName = baseName + prefix + (values ? '_' + values : '');
    if (oldName !== newName) {
        window['changeSpec'](id, newName);
    }
};
window['runVLexamples'] = function () {
    selectAll('.vl-example').each(function () {
        getSpec(this);
    });
};
window['runVLexamples']();
//# sourceMappingURL=index.js.map