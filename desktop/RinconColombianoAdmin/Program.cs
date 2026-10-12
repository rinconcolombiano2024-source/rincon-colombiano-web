using System.Diagnostics;
using System.Drawing;
using System.Net;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RinconColombianoAdmin;

/// <summary>
/// Native Windows CEO/admin window. The web server owns all authorization,
/// business logic, menu changes, payments and data. This app never handles
/// Supabase service_role, tokens, restaurant IDs or embedded passwords.
/// </summary>
internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new AdminWindow());
    }
}

internal sealed class AdminWindow : Form
{
    // Intentionally pinned to the official domain: no arbitrary remote URL
    // can be configured to impersonate the CEO login form.
    private const string OfficialOrigin = "https://rinconcolombiano.pl";
    private static readonly Uri AdminUrl = new(OfficialOrigin + "/admin");

    private static readonly Color Blue = Color.FromArgb(18, 61, 115);
    private static readonly Color Yellow = Color.FromArgb(247, 198, 0);
    private static readonly Color Red = Color.FromArgb(201, 45, 57);

    private readonly WebView2 _web = new() { Dock = DockStyle.Fill };
    private readonly Label _state = new()
    {
        AutoSize = false,
        Dock = DockStyle.Fill,
        Text = "Verificando conexión segura…",
        ForeColor = Color.White,
        TextAlign = ContentAlignment.MiddleLeft,
    };
    private readonly Panel _placeholder = new()
    {
        Dock = DockStyle.Fill,
        BackColor = Color.FromArgb(244, 241, 235),
    };

    private readonly HttpClient _http = new(new HttpClientHandler
    {
        AllowAutoRedirect = false,
        UseCookies = false,
    })
    {
        Timeout = TimeSpan.FromSeconds(12),
    };

    private bool _ready;
    private bool _connecting;

    // Native shortcuts are pinned to known protected routes. This list is
    // intentionally NOT supplied by the server, a URL parameter or config.
    private static readonly HashSet<string> AdminShortcuts = new(StringComparer.Ordinal)
    {
        "/admin",
        "/admin/operations",
        "/admin/menu",
        "/admin/home",
        "/admin/marketing",
        "/admin/seo",
        "/admin/brand",
        "/admin/content",
    };

    public AdminWindow()
    {
        Text = "Rincón Colombiano | CEO y Administración";
        MinimumSize = new Size(800, 600);
        Size = new Size(1280, 850);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.White;
        Font = new Font("Segoe UI", 10F);
        AutoScaleMode = AutoScaleMode.Dpi;

        var title = new Label
        {
            Text = "🇨🇴 RINCÓN COLOMBIANO  |  CEO · ADMINISTRACIÓN",
            Dock = DockStyle.Fill,
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 12F, FontStyle.Bold),
            TextAlign = ContentAlignment.MiddleLeft,
            AutoEllipsis = true,
        };
        var home = Command("Panel", async () => await ConnectAsync());
        var refresh = Command("Actualizar", () =>
        {
            if (_ready)
            {
                _web.Reload();
            }
            else
            {
                _ = ConnectAsync();
            }
        });
        var website = Command("Sitio comercial ↗",
            () => OpenExternal(new Uri(OfficialOrigin)));

        var toolbar = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 64,
            BackColor = Blue,
            Padding = new Padding(20, 8, 12, 8),
            ColumnCount = 4,
            RowCount = 1,
        };
        toolbar.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        toolbar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 100));
        toolbar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 120));
        toolbar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 175));
        toolbar.Controls.Add(title, 0, 0);
        toolbar.Controls.Add(home, 1, 0);
        toolbar.Controls.Add(refresh, 2, 0);
        toolbar.Controls.Add(website, 3, 0);

        var shortcuts = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 56,
            BackColor = Color.FromArgb(244, 241, 235),
            Padding = new Padding(12, 6, 12, 4),
            WrapContents = false,
            AutoScroll = true,
            AccessibleName = "Accesos rápidos de administración",
        };
        foreach (var (label, path) in new (string Label, string Path)[]
        {
            ("CEO", "/admin/operations"),
            ("Menú y productos", "/admin/menu"),
            ("Editar web", "/admin/home"),
            ("SEO", "/admin/seo"),
            ("Publicidad", "/admin/marketing"),
            ("Fotografías", "/admin/brand"),
            ("Contenidos", "/admin/content"),
        })
        {
            var button = Command(label, () => NavigateAdminPage(path));
            button.AutoSize = true;
            button.MinimumSize = new Size(92, 38);
            button.Margin = new Padding(3, 2, 3, 2);
            button.BackColor = Color.White;
            button.FlatAppearance.BorderColor = Blue;
            button.FlatAppearance.BorderSize = 1;
            button.AccessibleName = $"Abrir {label} del administrador";
            shortcuts.Controls.Add(button);
        }

        var colors = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 7,
            ColumnCount = 3,
            RowCount = 1,
        };
        colors.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        colors.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25));
        colors.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25));
        colors.Controls.Add(new Panel { Dock = DockStyle.Fill, BackColor = Yellow }, 0, 0);
        colors.Controls.Add(new Panel { Dock = DockStyle.Fill, BackColor = Blue }, 1, 0);
        colors.Controls.Add(new Panel { Dock = DockStyle.Fill, BackColor = Red }, 2, 0);

        var status = new Panel
        {
            Dock = DockStyle.Bottom,
            Height = 34,
            BackColor = Blue,
            Padding = new Padding(16, 0, 0, 0),
        };
        status.Controls.Add(_state);

        var message = new Label
        {
            Name = "LaunchMessage",
            Dock = DockStyle.Fill,
            Text = "Comprobando el servidor de administración…",
            TextAlign = ContentAlignment.MiddleCenter,
            Font = new Font("Segoe UI", 14F, FontStyle.Regular),
            ForeColor = Blue,
            Padding = new Padding(25),
        };
        _placeholder.Controls.Add(message);

        // Docking order: browser fills the interior; placeholder overlays it
        // until the official admin manifest has passed the HTTPS verification.
        Controls.Add(_web);
        Controls.Add(_placeholder);
        Controls.Add(status);
        Controls.Add(colors);
        Controls.Add(shortcuts);
        Controls.Add(toolbar);

        _web.Visible = false;
        Shown += async (_, _) => await ConnectAsync();
        FormClosed += (_, _) => _http.Dispose();
    }

    private static Button Command(string title, Action action)
    {
        var button = new Button
        {
            Text = title,
            Dock = DockStyle.Fill,
            FlatStyle = FlatStyle.Flat,
            BackColor = Yellow,
            ForeColor = Color.Black,
            Font = new Font("Segoe UI", 9F, FontStyle.Bold),
            Margin = new Padding(4),
            Cursor = Cursors.Hand,
        };
        button.FlatAppearance.BorderSize = 0;
        button.Click += (_, _) => action();
        return button;
    }

    private static Button Command(string title, Func<Task> action)
    {
        return Command(title, (Action)(() => { _ = action(); }));
    }

    private void Report(string message, bool error = false)
    {
        _state.Text = message;
        _state.ForeColor = error ? Yellow : Color.White;
        if (_placeholder.Controls["LaunchMessage"] is Label label)
        {
            label.Text = message;
        }
    }

    private void NavigateAdminPage(string path)
    {
        if (!_ready || _web.CoreWebView2 is null)
        {
            Report("La administración aún no está lista. Espera la verificación del dominio.", true);
            return;
        }

        if (!AdminShortcuts.Contains(path))
        {
            Report("Ruta administrativa no autorizada.", true);
            return;
        }

        var target = new Uri(OfficialOrigin + path);
        if (!IsOfficialAdminNavigation(target.AbsoluteUri))
        {
            Report("Destino fuera del dominio administrativo permitido.", true);
            return;
        }

        _web.CoreWebView2.Navigate(target.AbsoluteUri);
    }

    private static bool IsOfficialAdminNavigation(string candidate)
    {
        if (!Uri.TryCreate(candidate, UriKind.Absolute, out var url))
        {
            return false;
        }

        return url.Scheme == Uri.UriSchemeHttps &&
               url.Host.Equals(AdminUrl.Host, StringComparison.OrdinalIgnoreCase) &&
               url.IsDefaultPort &&
               (url.AbsolutePath == "/admin" ||
                url.AbsolutePath.StartsWith("/admin/", StringComparison.Ordinal));
    }

    private static void OpenExternal(Uri url)
    {
        if (url.Scheme != Uri.UriSchemeHttps &&
            url.Scheme != "mailto")
        {
            return;
        }
        try
        {
            Process.Start(new ProcessStartInfo(url.AbsoluteUri)
            {
                UseShellExecute = true,
            });
        }
        catch
        {
            // External links must never crash the application.
        }
    }

    private async Task<bool> IsPublishedOfficialAdminAsync()
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get, OfficialOrigin + "/admin/manifest.webmanifest");
        using var response = await _http.SendAsync(
            request, HttpCompletionOption.ResponseHeadersRead);

        // Never follow redirects to unrelated sites (including SumUp).
        if (response.StatusCode != HttpStatusCode.OK ||
            !string.Equals(response.Content.Headers.ContentType?.MediaType,
                "application/manifest+json", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var manifest = await JsonDocument.ParseAsync(stream);
        var root = manifest.RootElement;
        return root.TryGetProperty("id", out var id) &&
               id.GetString() == "/admin" &&
               root.TryGetProperty("start_url", out var start) &&
               start.GetString() == "/admin" &&
               root.TryGetProperty("scope", out var scope) &&
               scope.GetString() == "/admin";
    }

    private async Task ConnectAsync()
    {
        if (IsDisposed || _connecting)
        {
            return;
        }

        _connecting = true;
        Report("Verificando administración de Rincón Colombiano…");
        try
        {
            if (!await IsPublishedOfficialAdminAsync())
            {
                _ready = false;
                _web.Visible = false;
                _placeholder.Visible = true;
                Report(
                    "La nueva administración todavía no está publicada en rinconcolombiano.pl.\n\n" +
                    "La página antigua no permite iniciar Rincón Admin.\n" +
                    "Cuando el despliegue oficial de Next.js termine, pulsa «Actualizar».\n\n" +
                    "No se han enviado credenciales ni se ha abierto otra página.",
                    error: true);
                return;
            }

            if (_web.CoreWebView2 is null)
            {
                var profile = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "RinconColombiano", "CEODesktop", "WebView2");

                var env = await CoreWebView2Environment.CreateAsync(
                    userDataFolder: profile);
                await _web.EnsureCoreWebView2Async(env);

                var core = _web.CoreWebView2;
                core.Settings.AreDevToolsEnabled = false;
                core.Settings.AreDefaultContextMenusEnabled = false;
                core.Settings.IsStatusBarEnabled = false;

                core.NavigationStarting += (_, args) =>
                {
                    if (!IsOfficialAdminNavigation(args.Uri))
                    {
                        args.Cancel = true;
                        if (Uri.TryCreate(args.Uri, UriKind.Absolute, out var external))
                        {
                            OpenExternal(external);
                        }
                    }
                };
                core.NewWindowRequested += (_, args) =>
                {
                    args.Handled = true;
                    if (IsOfficialAdminNavigation(args.Uri))
                    {
                        core.Navigate(args.Uri);
                    }
                    else if (Uri.TryCreate(args.Uri, UriKind.Absolute, out var external))
                    {
                        OpenExternal(external);
                    }
                };
                core.NavigationCompleted += (_, args) =>
                {
                    Report(args.IsSuccess
                        ? "Conectado por HTTPS · Acceso sujeto a autenticación y permisos"
                        : "La conexión con el administrador se interrumpió.", !args.IsSuccess);
                };
                core.PermissionRequested += (_, args) =>
                {
                    // No camera/mic/geolocation/browser notifications in CEO client.
                    args.State = CoreWebView2PermissionState.Deny;
                };
            }

            _ready = true;
            _placeholder.Visible = false;
            _web.Visible = true;
            _web.CoreWebView2.Navigate(AdminUrl.AbsoluteUri);
            Report("Conectando con el panel de administración…");
        }
        catch (Exception exception)
        {
            _ready = false;
            _web.Visible = false;
            _placeholder.Visible = true;
            Report(
                "No se pudo abrir la aplicación.\n\n" +
                "Comprueba Internet y que Microsoft Edge WebView2 Runtime esté instalado.\n\n" +
                exception.Message,
                error: true);
        }
        finally
        {
            _connecting = false;
        }
    }
}
