/**
 * Utility functions for geometric calculations
 */
class GeometryUtils {
    /**
     * Calculate the distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} - The distance between the points
     */
    static calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate the angle between two points in degrees
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} - The angle in degrees
     */
    static calculateAngle(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }

    /**
     * Calculate the midpoint between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {Object} - The midpoint coordinates {x, y}
     */
    static calculateMidpoint(x1, y1, x2, y2) {
        return {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
        };
    }

    /**
     * Generate control points for a bezier curve between two points
     * @param {number} x1 - X coordinate of start point
     * @param {number} y1 - Y coordinate of start point
     * @param {number} x2 - X coordinate of end point
     * @param {number} y2 - Y coordinate of end point
     * @returns {Object} - The control points {controlPoint1, controlPoint2}
     */
    static generateBezierControlPoints(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        return {
            controlPoint1: {
                x: x1 + dx / 3,
                y: y1 + dy / 3
            },
            controlPoint2: {
                x: x1 + dx * 2 / 3,
                y: y1 + dy * 2 / 3
            }
        };
    }

    /**
     * Generate a random point at a specific distance and random angle from a center point
     * @param {number} centerX - X coordinate of center point
     * @param {number} centerY - Y coordinate of center point
     * @param {number} distance - Distance from center point
     * @returns {Object} - The random point coordinates {x, y}
     */
    static generateRandomPointAtDistance(centerX, centerY, distance) {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance
        };
    }

    /**
     * Calculate the path data for a bezier curve between two points
     * @param {number} x1 - X coordinate of start point
     * @param {number} y1 - Y coordinate of start point
     * @param {number} x2 - X coordinate of end point
     * @param {number} y2 - Y coordinate of end point
     * @returns {string} - SVG path data string
     */
    static calculateBezierPath(x1, y1, x2, y2) {
        const { controlPoint1, controlPoint2 } = this.generateBezierControlPoints(x1, y1, x2, y2);
        
        return `M ${x1} ${y1} 
                C ${controlPoint1.x} ${controlPoint1.y},
                  ${controlPoint2.x} ${controlPoint2.y},
                  ${x2} ${y2}`;
    }
}

export default GeometryUtils;