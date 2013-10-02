const getSquareDistance = (p1, p2) => { // square distance between 2 points

		const dx = p1[0] - p2[0];
		const dy = p1[1] - p2[1];

		return dx * dx + dy * dy;
	}

const getSquareSegmentDistance = (p, p1, p2) => { // square distance from a point to a segment

		var x = p1[0],
		    y = p1[1],
		    dx = p2[0] - x,
		    dy = p2[1] - y;

		if (dx !== 0 || dy !== 0) {

			const t = ((p[0] - x) * dx +
			     (p[1] - y) * dy) /
			        (dx * dx +
			         dy * dy);

			if (t > 1) {
				x = p2[0];
				y = p2[1];

			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p[0] - x;
		dy = p[1] - y;

		return dx * dx + dy * dy;
	}

	// the rest of the code doesn't care for the point format


	// basic distance-based simplification

const simplifyRadialDistance = (points, sqTolerance) => {

		let [prePoint,...pt] = points;
		let newPoints = [prevPoint];

		for (let point of pt) {

			if (getSquareDistance(point, prevPoint) > sqTolerance) {
				newPoints.push(point);
				prevPoint = point;
			}
		}

		if (prevPoint !== points[pt.length]) {
			newPoints.push(points[pt.length]);
		}

		return newPoints;
	}


	// simplification using optimized Douglas-Peucker algorithm with recursion elimination

const simplifyDouglasPeucker = (points, sqTolerance) => {

		const len = points.length;

		let markers = new Uint8Array(len);

		let first = 0;
		let last  = len - 1;

		let index;

		let firstStack = [];
		let lastStack  = [];

		let newPoints  = [];

		markers[first] = markers[last] = 1;

		while (last) {

			let maxSqDist = 0;

			for (let i = first + 1; i < last; i++) {
				let sqDist = getSquareSegmentDistance(points[i], points[first], points[last]);

				if (sqDist > maxSqDist) {
					index = i;
					maxSqDist = sqDist;
				}
			}

			if (maxSqDist > sqTolerance) {
				markers[index] = 1;

				firstStack.push(first);
				lastStack.push(index);

				firstStack.push(index);
				lastStack.push(last);
			}

			first = firstStack.pop();
			last = lastStack.pop();
		}

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	}


	// both algorithms combined for awesome performance

module.exports = (points, tolerance=1, highestQuality=false) =>{

		const sqTolerance = tolerance * tolerance;
        if(highestQuality){
            return simplifyDouglasPeucker(points, sqTolerance);
        }else{
            return simplifyDouglasPeucker(simplifyRadialDistance(points, sqTolerance), sqTolerance);
        }
	};
