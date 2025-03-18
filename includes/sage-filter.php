<?php
/**
 * Sage 11 Blade Directives Filter
 * 
 * This file registers the bonsaiPlanet directive with Sage 11 via the sage/blade/directives filter.
 */

add_filter('sage/blade/directives', function($directives) {
    $directives['bonsaiPlanet'] = function($expression) {
        return "<?php 
        \$id = null;
        \$width = '100%';
        \$height = '500px';
        
        // Parse the expression to extract attributes
        if (!empty($expression)) {
            preg_match_all('/(\w+)\s*=\s*[\'\"](.*?)[\'\"]/', $expression, \$planetMatches);
            
            if (!empty(\$planetMatches[0])) {
                for (\$i = 0; \$i < count(\$planetMatches[0]); \$i++) {
                    switch(\$planetMatches[1][\$i]) {
                        case 'id':
                            \$id = \$planetMatches[2][\$i];
                            break;
                        case 'width':
                            \$width = \$planetMatches[2][\$i];
                            break;
                        case 'height':
                            \$height = \$planetMatches[2][\$i];
                            break;
                    }
                }
            }
        }
        
        include '" . plugin_dir_path(dirname(__FILE__)) . "includes/planet-template.php'; 
        ?>";
    };
    
    return $directives;
}); 