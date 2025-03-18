<?php

namespace BonsaiPlanets\Providers;

use Roots\Acorn\ServiceProvider;

class BonsaiPlanetsServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Register plugin bindings
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Debug: Check if we're in a Sage environment
        if (!function_exists('Roots\view')) {
            error_log('Bonsai Planets: Not in a Sage environment');
            return;
        }

        // Register Blade directives
        $this->registerBladeDirectives();

        // Add assets to view
        add_filter('sage/assets/scripts', [$this, 'enqueueScripts']);
        add_filter('sage/assets/styles', [$this, 'enqueueStyles']);
    }

    /**
     * Register Blade directives
     *
     * @return void
     */
    protected function registerBladeDirectives()
    {
        // Debug: Log when directive is being registered
        error_log('Bonsai Planets: Registering Blade directive');

        $this->app->make('blade.compiler')->directive('bonsaiPlanet', function ($expression) {
            // Debug: Log the expression being processed
            error_log('Bonsai Planets: Processing directive with expression: ' . $expression);
            
            // Ensure the expression is properly escaped
            $expression = str_replace("'", "\\'", $expression);
            
            return "<?php echo do_shortcode('[bonsai_planet ' . {$expression} . ']'); ?>";
        });
    }

    /**
     * Register scripts with Sage's asset system
     *
     * @param array $scripts
     * @return array
     */
    public function enqueueScripts($scripts)
    {
        // Debug: Log script registration
        error_log('Bonsai Planets: Registering scripts');

        $scripts['bonsai-planets'] = [
            'path' => BONSAI_PLANETS_ASSETS . 'js/bonsai-planets-bundle.js',
            'dependencies' => [],
            'version' => BONSAI_PLANETS_VERSION,
        ];

        return $scripts;
    }

    /**
     * Register styles with Sage's asset system
     *
     * @param array $styles
     * @return array
     */
    public function enqueueStyles($styles)
    {
        // Debug: Log style registration
        error_log('Bonsai Planets: Registering styles');

        $styles['bonsai-planets'] = [
            'path' => BONSAI_PLANETS_ASSETS . 'css/bonsai-planets.css',
            'dependencies' => [],
            'version' => BONSAI_PLANETS_VERSION,
        ];

        return $styles;
    }
} 