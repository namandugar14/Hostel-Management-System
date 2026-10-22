app.controller('AuthController', function ($scope, $location, authService) {

    var currentPath = $location.path();

    // Redirect if already logged in (unless performing password reset)
    var user = authService.getUser();
    if (user && currentPath !== '/forgot-password' && currentPath !== '/reset-password') {
        if (user.role === 'Admin' || user.role === 'Warden') $location.path('/admin/dashboard');
        else if (user.role === 'Mess Owner') $location.path('/mess-owner/dashboard');
        else $location.path('/student/dashboard');
    }

    $scope.loginData = {};
    $scope.registerData = { course: 'None' };
    $scope.loading = false;
    $scope.errorMsg = '';
    $scope.successMsg = '';

    // Forgot Password State
    $scope.forgotData = {};
    $scope.submittedSuccessfully = false;
    $scope.simulatedUrl = '';

    // Reset Password State
    $scope.resetData = {};
    $scope.resetCompleted = false;
    $scope.verifyingToken = false;
    $scope.tokenInvalid = false;
    $scope.tokenInvalidMsg = '';
    $scope.verifiedEmail = '';
    $scope.tokenFromUrl = false;

    // Check if on /reset-password route and token is passed in query
    if (currentPath === '/reset-password') {
        var params = $location.search();
        if (params && params.token) {
            $scope.resetData.token = params.token;
            $scope.tokenFromUrl = true;
            $scope.verifyingToken = true;

            authService.verifyResetToken(params.token).then(function (res) {
                $scope.verifyingToken = false;
                $scope.verifiedEmail = res.data.email;
            }).catch(function (err) {
                $scope.verifyingToken = false;
                $scope.tokenInvalid = true;
                $scope.tokenInvalidMsg = (err && err.data && err.data.error) ? err.data.error : 'Invalid or expired reset token.';
            });
        }
    }

    $scope.doLogin = function () {
        $scope.loading = true;
        $scope.errorMsg = '';

        authService.login($scope.loginData).then(function (res) {
            $scope.loading = false;
            authService.saveToken(res.data.token);
            authService.saveUser(res.data.user);

            if (res.data.user.role === 'Admin' || res.data.user.role === 'Warden') {
                $location.path('/admin/dashboard');
            } else if (res.data.user.role === 'Mess Owner') {
                $location.path('/mess-owner/dashboard');
            } else {
                $location.path('/student/dashboard');
            }
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = (err && err.data && err.data.error) ? err.data.error : 'Login failed. Please check your connection or try again later.';
        });
    };

    $scope.doRegister = function () {
        $scope.loading = true;
        $scope.errorMsg = '';

        authService.register($scope.registerData).then(function (res) {
            $scope.loading = false;
            $scope.successMsg = 'Registration successful! You can now login.';
            $scope.registerData = { course: 'None' }; // reset
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = (err && err.data && err.data.error) ? err.data.error : 'Registration failed. Please check your connection or try again later.';
        });
    };

    $scope.doForgotPassword = function () {
        $scope.loading = true;
        $scope.errorMsg = '';
        $scope.successMsg = '';
        $scope.simulatedUrl = '';
        $scope.previewUrl = '';

        authService.forgotPassword($scope.forgotData.email).then(function (res) {
            $scope.loading = false;
            $scope.submittedSuccessfully = true;
            $scope.successMsg = res.data.message || 'Password reset link sent! Check your inbox.';
            if (res.data.previewUrl) {
                $scope.previewUrl = res.data.previewUrl;
            }
            if (res.data.simulated || res.data.fallback) {
                $scope.simulatedUrl = res.data.resetUrl;
            }
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = (err && err.data && err.data.error) ? err.data.error : 'Failed to send reset email. Please try again.';
        });
    };

    $scope.resetForgotForm = function () {
        $scope.forgotData = {};
        $scope.submittedSuccessfully = false;
        $scope.successMsg = '';
        $scope.errorMsg = '';
        $scope.simulatedUrl = '';
        $scope.previewUrl = '';
    };

    $scope.doResetPassword = function () {
        if (!$scope.resetData.password || !$scope.resetData.confirmPassword) {
            $scope.errorMsg = 'Please enter and confirm your new password.';
            return;
        }

        if ($scope.resetData.password !== $scope.resetData.confirmPassword) {
            $scope.errorMsg = 'Passwords do not match.';
            return;
        }

        if ($scope.resetData.password.length < 6) {
            $scope.errorMsg = 'Password must be at least 6 characters.';
            return;
        }

        $scope.loading = true;
        $scope.errorMsg = '';
        $scope.successMsg = '';

        authService.resetPassword($scope.resetData.token, $scope.resetData.password).then(function (res) {
            $scope.loading = false;
            $scope.resetCompleted = true;
            $scope.successMsg = res.data.message || 'Password reset successfully! You can now log in.';
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = (err && err.data && err.data.error) ? err.data.error : 'Failed to reset password. Please try again.';
        });
    };
});
