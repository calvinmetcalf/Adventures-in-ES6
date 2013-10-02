var getSquareDistance = (function(p1, p2) {
  var dx = $traceurRuntime.elementGet(p1, 0) - $traceurRuntime.elementGet(p2, 0);
  var dy = $traceurRuntime.elementGet(p1, 1) - $traceurRuntime.elementGet(p2, 1);
  return dx * dx + dy * dy;
});
var getSquareSegmentDistance = (function(p, p1, p2) {
  var x = $traceurRuntime.elementGet(p1, 0), y = $traceurRuntime.elementGet(p1, 1), dx = $traceurRuntime.elementGet(p2, 0) - x, dy = $traceurRuntime.elementGet(p2, 1) - y;
  if (dx !== 0 || dy !== 0) {
    try {
      throw undefined;
    } catch (t) {
      t = (($traceurRuntime.elementGet(p, 0) - x) * dx + ($traceurRuntime.elementGet(p, 1) - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = $traceurRuntime.elementGet(p2, 0);
        y = $traceurRuntime.elementGet(p2, 1);
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
  }
  dx = $traceurRuntime.elementGet(p, 0) - x;
  dy = $traceurRuntime.elementGet(p, 1) - y;
  return dx * dx + dy * dy;
});
var simplifyRadialDistance = (function(points, sqTolerance) {
  var $__2 = points, prePoint = $traceurRuntime.elementGet($__2, 0), pt = Array.prototype.slice.call($__2, 1);
  var newPoints = [prevPoint];
  for (var $__0 = $traceurRuntime.getIterator(pt), $__1; !($__1 = $__0.next()).done;) {
    try {
      throw undefined;
    } catch (point) {
      point = $__1.value;
      {
        if (getSquareDistance(point, prevPoint) > sqTolerance) {
          newPoints.push(point);
          prevPoint = point;
        }
      }
    }
  }
  if (prevPoint !== $traceurRuntime.elementGet(points, pt.length)) {
    newPoints.push($traceurRuntime.elementGet(points, pt.length));
  }
  return newPoints;
});
var simplifyDouglasPeucker = (function(points, sqTolerance) {
  var len = points.length;
  var markers = new Uint8Array(len);
  var first = 0;
  var last = len - 1;
  var index;
  var firstStack = [];
  var lastStack = [];
  var newPoints = [];
  $traceurRuntime.elementSet(markers, first, $traceurRuntime.elementSet(markers, last, 1));
  while (last) {
    try {
      throw undefined;
    } catch (maxSqDist) {
      maxSqDist = 0;
      {
        try {
          throw undefined;
        } catch ($i) {
          $i = first + 1;
          for (; $i < last; $i++) {
            try {
              throw undefined;
            } catch (i) {
              i = $i;
              try {
                try {
                  throw undefined;
                } catch (sqDist) {
                  sqDist = getSquareSegmentDistance($traceurRuntime.elementGet(points, i), $traceurRuntime.elementGet(points, first), $traceurRuntime.elementGet(points, last));
                  if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                  }
                }
              } finally {
                $i = i;
              }
            }
          }
        }
      }
      if (maxSqDist > sqTolerance) {
        $traceurRuntime.elementSet(markers, index, 1);
        firstStack.push(first);
        lastStack.push(index);
        firstStack.push(index);
        lastStack.push(last);
      }
      first = firstStack.pop();
      last = lastStack.pop();
    }
  }
  for (i = 0; i < len; i++) {
    if ($traceurRuntime.elementGet(markers, i)) {
      newPoints.push($traceurRuntime.elementGet(points, i));
    }
  }
  return newPoints;
});
function simplify(points) {
  var tolerance = $traceurRuntime.elementGet(arguments, 1) !== (void 0) ? $traceurRuntime.elementGet(arguments, 1): 1;
  var highestQuality = $traceurRuntime.elementGet(arguments, 2) !== (void 0) ? $traceurRuntime.elementGet(arguments, 2): false;
  var sqTolerance = tolerance * tolerance;
  if (highestQuality) {
    return simplifyDouglasPeucker(points, sqTolerance);
  } else {
    return simplifyDouglasPeucker(simplifyRadialDistance(points, sqTolerance), sqTolerance);
  }
}
;
