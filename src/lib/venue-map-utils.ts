import { RefObject } from 'react';

export interface MapSelectionOptions {
    containerRef: RefObject<HTMLDivElement | null>;
    onSelectionsChange: (sections: string[]) => void;
    initialSelections?: string[];
}

export const loadVenueMap = async (
    mapId: string,
    options: MapSelectionOptions,
    selectableIds: string[], // not used for now, but can filter segments
    setMapLoading: (loading: boolean) => void,
    setMapError: (error: string | null) => void
) => {
    const { containerRef, onSelectionsChange, initialSelections = [] } = options;

    const jsonUrl =
        `https://mapsapi.tmol.io/maps/geometry/3/event/${mapId}/placeDetailNoKeys` +
        `?useHostGrids=true&app=PRD2663_EDP_NA&sectionLevel=true&systemId=HOST`;
    const bgSvgUrl =
        `https://mapsapi.tmol.io/maps/geometry/3/event/${mapId}/staticImage?systemId=HOST&sectionLevel=true&app=PRD2663_EDP_NA&sectionColor=2A56D9&avertaFonts=true`;

    try {
        setMapLoading(true);
        const [jsonRes, bgRes] = await Promise.all([fetch(jsonUrl), fetch(bgSvgUrl)]);
        if (!jsonRes.ok) throw new Error(`JSON fetch failed: ${jsonRes.status}`);
        if (!bgRes.ok) throw new Error(`SVG fetch failed: ${bgRes.status}`);

        const data = await jsonRes.json();
        const svgText = await bgRes.text();
        const page = data.pages[0];

        // Prepare container
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';
        containerRef.current.style.overflow = 'hidden';

        // Fade-in wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.opacity = '0';
        wrapper.style.transition = 'opacity 0.5s ease';
        containerRef.current.appendChild(wrapper);

        // Background SVG
        const bgContainer = document.createElement('div');
        bgContainer.style.position = 'absolute';
        bgContainer.style.top = '0';
        bgContainer.style.left = '0';
        bgContainer.style.width = '100%';
        bgContainer.style.height = '100%';
        bgContainer.innerHTML = svgText;
        const bgSvg = bgContainer.querySelector('svg')!;
        bgSvg.setAttribute('width', '100%');
        bgSvg.setAttribute('height', '100%');
        wrapper.appendChild(bgContainer);

        // Overlay SVG for interactive shapes
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${page.width} ${page.height}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        wrapper.appendChild(svg);

        // Fade in wrapper after DOM insert
        requestAnimationFrame(() => {
            wrapper.style.opacity = '1';
        });

        // Gather segments (flattened)
        type Seg = {
            id: string;
            name: string;
            shapes: Array<{
                path: string;
                labels?: Array<{ text: string }>;
            }>;
        };
        const segments: Seg[] = [];
        for (const seg of page.segments) {
            if (seg.shapes) segments.push({ id: seg.id, name: seg.name, shapes: seg.shapes });
            if (Array.isArray(seg.segments)) {
                for (const sub of seg.segments) {
                    if (sub.shapes) segments.push({ id: sub.id, name: sub.name, shapes: sub.shapes });
                }
            }
        }

        const pathEls: SVGPathElement[] = [];

        segments.forEach(seg => {
            seg.shapes.forEach(shape => {
                const p = document.createElementNS(SVG_NS, 'path');
                p.setAttribute('d', shape.path);
                p.setAttribute('data-id', seg.id);
                // compute a display label from the first label on the shape (fallback to seg.name)
                const labelText = shape.labels && shape.labels.length > 0
                    ? shape.labels[0].text
                    : seg.name;
                p.setAttribute('data-label', labelText);

                p.setAttribute('fill', 'transparent');
                p.style.cursor = 'pointer';
                p.style.transition = 'fill 0.3s ease, transform 0.3s ease';
                p.style.transformOrigin = 'center center';

                // Hover effects
                p.addEventListener('mouseover', () => {
                    if (!p.classList.contains('selected')) {
                        p.style.fill = 'rgba(200,200,200,0.3)';
                    }
                });
                p.addEventListener('mouseout', () => {
                    if (!p.classList.contains('selected')) {
                        p.style.fill = 'transparent';
                        p.style.transform = 'scale(1)';
                    }
                });

                // Click: toggle selection and callback with labels, not seg.name
                p.addEventListener('click', e => {
                    e.stopPropagation();
                    const multi = (e as MouseEvent).shiftKey;
                    const groupKey = seg.id.charAt(0);

                    if (multi) {
                        const targetState = !p.classList.contains('selected');
                        pathEls
                            .filter(el => el.getAttribute('data-id')!.startsWith(groupKey))
                            .forEach(el => {
                                el.classList.toggle('selected', targetState);
                                el.style.fill = targetState ? 'rgba(0, 246, 61, 0.6)' : 'transparent';
                            });
                    } else {
                        const isSel = !p.classList.contains('selected');
                        p.classList.toggle('selected', isSel);
                        p.style.fill = isSel ? 'rgba(0, 246, 61, 0.6)' : 'transparent';
                    }

                    // collect *label* values of all selected paths
                    const selectedLabels = pathEls
                        .filter(el => el.classList.contains('selected'))
                        .map(el => el.getAttribute('data-label')!);

                    onSelectionsChange(selectedLabels);
                });

                svg.appendChild(p);
                pathEls.push(p);
            });
        });

        // Apply initial selections
        initialSelections.forEach(selId => {
            const element = svg.querySelector<SVGPathElement>(`path[data-id=\"${selId}\"]`);
            if (element) {
                element.classList.add('selected');
                element.style.fill = 'rgba(100,150,240,0.6)';
            }
        });

        setMapError(null);
    } catch (err) {
        console.error(err);
        setMapError(err instanceof Error ? err.message : String(err));
    } finally {
        setMapLoading(false);
    }
};
