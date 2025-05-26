{
  description = "A basic repl.it environment";

  pkgs = import <nixpkgs> { };

  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.libuuid
    ];
  };
}