/**
 * Regression Smoke Tests
 * 
 * These tests import every page component to catch:
 * - Broken imports / missing modules
 * - Compile-time errors
 * - Missing exports
 * 
 * They do NOT render the components — just verify they can be imported.
 */

describe('Regression — Page Imports', () => {

  // ── Admin Pages ─────────────────────────────────────────────────────────
  describe('Admin Pages', () => {
    it('admin dashboard exports default', () => {
      const mod = require('@/app/admin/page');
      expect(mod.default).toBeDefined();
    });

    it('admin analytics exports default', () => {
      const mod = require('@/app/admin/analytics/page');
      expect(mod.default).toBeDefined();
    });

    it('admin announcements exports default', () => {
      const mod = require('@/app/admin/announcements/page');
      expect(mod.default).toBeDefined();
    });

    it('admin companies exports default', () => {
      const mod = require('@/app/admin/companies/page');
      expect(mod.default).toBeDefined();
    });

    it('admin courses exports default', () => {
      const mod = require('@/app/admin/courses/page');
      expect(mod.default).toBeDefined();
    });

    it('admin job-roles exports default', () => {
      const mod = require('@/app/admin/job-roles/page');
      expect(mod.default).toBeDefined();
    });

    it('admin jobs exports default', () => {
      const mod = require('@/app/admin/jobs/page');
      expect(mod.default).toBeDefined();
    });

    it('admin lessons exports default', () => {
      const mod = require('@/app/admin/lessons/page');
      expect(mod.default).toBeDefined();
    });

    it('admin modules exports default', () => {
      const mod = require('@/app/admin/modules/page');
      expect(mod.default).toBeDefined();
    });

    it('admin notes exports default', () => {
      const mod = require('@/app/admin/notes/page');
      expect(mod.default).toBeDefined();
    });

    it('admin quizzes exports default', () => {
      const mod = require('@/app/admin/quizzes/page');
      expect(mod.default).toBeDefined();
    });

    it('admin users exports default', () => {
      const mod = require('@/app/admin/users/page');
      expect(mod.default).toBeDefined();
    });
  });

  // ── TPO Pages ───────────────────────────────────────────────────────────
  describe('TPO Pages', () => {
    it('tpo dashboard exports default', () => {
      const mod = require('@/app/tpo/page');
      expect(mod.default).toBeDefined();
    });

    it('tpo announcements exports default', () => {
      const mod = require('@/app/tpo/announcements/page');
      expect(mod.default).toBeDefined();
    });

    it('tpo drives exports default', () => {
      const mod = require('@/app/tpo/drives/page');
      expect(mod.default).toBeDefined();
    });

    it('tpo reports exports default', () => {
      const mod = require('@/app/tpo/reports/page');
      expect(mod.default).toBeDefined();
    });

    it('tpo students exports default', () => {
      const mod = require('@/app/tpo/students/page');
      expect(mod.default).toBeDefined();
    });
  });

  // ── Auth Pages ──────────────────────────────────────────────────────────
  describe('Auth Pages', () => {
    it('login exports default', () => {
      const mod = require('@/app/(auth)/login/page');
      expect(mod.default).toBeDefined();
    });

    it('register exports default', () => {
      const mod = require('@/app/(auth)/register/page');
      expect(mod.default).toBeDefined();
    });
  });

  // ── Public Pages ────────────────────────────────────────────────────────
  describe('Public Pages', () => {
    it('home page exports default', () => {
      const mod = require('@/app/page');
      expect(mod.default).toBeDefined();
    });

    it('about page exports default', () => {
      const mod = require('@/app/about/page');
      expect(mod.default).toBeDefined();
    });

    it('contact page exports default', () => {
      const mod = require('@/app/contact/page');
      expect(mod.default).toBeDefined();
    });

    it('privacy page exports default', () => {
      const mod = require('@/app/privacy/page');
      expect(mod.default).toBeDefined();
    });

    it('terms page exports default', () => {
      const mod = require('@/app/terms/page');
      expect(mod.default).toBeDefined();
    });
  });

  // ── Dashboard Pages ─────────────────────────────────────────────────────
  describe('Dashboard Pages', () => {
    it('dashboard page exports default', () => {
      const mod = require('@/app/dashboard/page');
      expect(mod.default).toBeDefined();
    });
  });
});

describe('Regression — Component Imports', () => {
  // ── Layouts ─────────────────────────────────────────────────────────────
  describe('Layout Components', () => {
    it('AdminLayout is importable', () => {
      const { AdminLayout } = require('@/components/layout/admin-layout');
      expect(AdminLayout).toBeDefined();
    });

    it('TpoLayout is importable', () => {
      const { TpoLayout } = require('@/components/layout/tpo-layout');
      expect(TpoLayout).toBeDefined();
    });

    it('DashboardLayout is importable', () => {
      const { DashboardLayout } = require('@/components/layout/dashboard-layout');
      expect(DashboardLayout).toBeDefined();
    });

    it('Header is importable', () => {
      const { Header } = require('@/components/layout/header');
      expect(Header).toBeDefined();
    });

    it('Sidebar is importable', () => {
      const { Sidebar } = require('@/components/layout/sidebar');
      expect(Sidebar).toBeDefined();
    });
  });

  // ── Auth Components ─────────────────────────────────────────────────────
  describe('Auth Components', () => {
    it('RouteGuard is importable', () => {
      const { RouteGuard } = require('@/components/auth/route-guard');
      expect(RouteGuard).toBeDefined();
    });

    it('OAuthButton is importable', () => {
      const { OAuthButton } = require('@/components/auth/oauth-button');
      expect(OAuthButton).toBeDefined();
    });
  });

  // ── Stores ──────────────────────────────────────────────────────────────
  describe('Stores', () => {
    it('useAuthStore is importable', () => {
      const { useAuthStore } = require('@/store/auth.store');
      expect(useAuthStore).toBeDefined();
    });
  });

  // ── Hooks ───────────────────────────────────────────────────────────────
  describe('Hooks', () => {
    it('useAdminDashboard is importable', () => {
      const { useAdminDashboard } = require('@/hooks/useAdminDashboard');
      expect(useAdminDashboard).toBeDefined();
    });

    it('useDashboard is importable', () => {
      const { useDashboard } = require('@/hooks/useDashboard');
      expect(useDashboard).toBeDefined();
    });

    it('useCourseModules is importable', () => {
      const mod = require('@/hooks/useCourseModules');
      expect(mod.useCourseModules || mod.default).toBeDefined();
    });

    it('useProgress is importable', () => {
      const mod = require('@/hooks/useProgress');
      expect(mod.useCourseProgress).toBeDefined();
    });
  });
});
