<?php
/**
 * Plugin Name:       Get Down Polaroid Slider
 * Description:       Adds a lightweight slider block with an option to display your slides as polaroid pictures.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           2.0
 * Author:            David Potter
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       getdown
 *
 * @package           create-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

function getdown_getdown_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'getdown_getdown_block_init' );