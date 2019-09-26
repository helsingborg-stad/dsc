<?php
// $test = wp_get_nav_menu_object(27);
// var_dump($test);
function register_visitor_menu() {
  register_nav_menu('visitor_menu',__( 'Visitor Menu' ));
}
add_action( 'init', 'register_visitor_menu' );

function register_local_menu() {
  register_nav_menu('local_menu',__( 'Local Menu' ));
}
add_action( 'init', 'register_local_menu' );

add_action('rest_api_init', hdsc_menu_register_routes);

function hdsc_menu_register_routes() {
  register_rest_route( 'wp/v2', '/menu', [
    methods  => WP_REST_Server::READABLE,
    callback => menu_callback
  ]);
}

function menu_callback(){
    $response = get_option('hdsc-temp-crm-json');
    $filtered_response = str_replace('\n', '', $response);
    $locations = get_nav_menu_locations();
    $menu_items = wp_get_nav_menu_items(27);
    $test = [];
    foreach($menu_items as $menu_item){
        array_push($test, get_post_meta($menu_item->ID, '_mycustom_field_2'));
    }
    return wp_get_nav_menu_items( $locations['header-menu']) ?? [];
}