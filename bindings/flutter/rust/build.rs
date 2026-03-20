fn main() {
    // Link against C++ standard library for macOS/iOS
    // This is required because ONNX Runtime (ort) is a C++ library
    #[cfg(target_os = "macos")]
    {
        println!("cargo:rustc-link-lib=c++");
    }

    #[cfg(target_os = "ios")]
    {
        println!("cargo:rustc-link-lib=c++");
    }

    // Android 15+ (API 35) requires ELF LOAD segments aligned to 16KB pages.
    // Without this, the app shows a compatibility warning and may fail on
    // devices that enforce 16KB page size.
    // Note: #[cfg(target_os)] checks the HOST, not the cross-compile target,
    // so we use CARGO_CFG_TARGET_OS instead.
    // See: https://developer.android.com/16kb-page-size
    if std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default() == "android" {
        println!("cargo:rustc-link-arg=-Wl,-z,max-page-size=16384");
    }
}
