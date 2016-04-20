'use strict';

/**
 * Create a codec method that:
 *
 *  1. splits the source into multiple lines;
 *  2. drops a specified number of lines;
 *  3. drops blank lines;
 *  4. returns the line as a string on a property of a JSON oject.
 */

module.exports = numRowsToDrop =>
  s => s

  /**
   * Split the input to a line at a time:
   */

  .split()

  /**
   * Drop the specified number of rows:
   */

  .drop(numRowsToDrop || 0)

  /**
   * Remove any blank lines. This is handy when there are trailing new lines:
   */

  .filter(row => row !== '')

  /**
   * Place each row in an object:
   */

  .map(row => ({message: row}))
  ;
