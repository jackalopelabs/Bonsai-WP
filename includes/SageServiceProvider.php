<?php
/**
 * Sage Service Provider for Bonsai Planets
 */

namespace BonsaiPlanets;

use Illuminate\Support\ServiceProvider;

class SageServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if ($this->app->bound('blade.compiler')) {
            $this->app->make('blade.compiler')->directive('bonsaiPlanet', function ($expression) {
                return "<?php 
                // Parse the expression to extract attributes
                \$planetExpression = $expression;
                \$planetMatches = [];
                preg_match_all('/(\w+)\s*=\s*[\'\"](.*?)[\'\"]/', \$planetExpression, \$planetMatches);
                
                \$planetAttrs = [];
                if (!empty(\$planetMatches[0])) {
                    for (\$i = 0; \$i < count(\$planetMatches[0]); \$i++) {
                        \$planetAttrs[\$planetMatches[1][\$i]] = \$planetMatches[2][\$i];
                    }
                }
                
                // Set default values
                \$id = \$planetAttrs['id'] ?? 'bonsai-planet-' . uniqid();
                \$width = \$planetAttrs['width'] ?? '100%';
                \$height = \$planetAttrs['height'] ?? '500px';
                
                // Include the template
                \$templatePath = WP_PLUGIN_DIR . '/bonsai-planets-wp/includes/planet-template.php';
                
                if (file_exists(\$templatePath)) {
                    include \$templatePath;
                } else {
                    echo 'Bonsai Planet template not found at ' . \$templatePath;
                }
                ?>";
            });
        }
    }
} 