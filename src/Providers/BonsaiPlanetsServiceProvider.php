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
        // Register Blade directives
        if (function_exists('Roots\view')) {
            $this->registerBladeDirectives();
        }

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
        $this->app->make('blade.compiler')->directive('bonsaiPlanet', function ($expression) {
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
        $styles['bonsai-planets'] = [
            'path' => BONSAI_PLANETS_ASSETS . 'css/bonsai-planets.css',
            'dependencies' => [],
            'version' => BONSAI_PLANETS_VERSION,
        ];

        return $styles;
    }
} 