<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Home.aspx.cs" Inherits="Home" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Untitled Page</title>
    <style type="text/css">
        .style1
        {
            width: 50%;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    
        <table class="style1">
            <tr>
                <td colspan="3">
                    <h2 style="text-align: center">Welcome To Gmail</h2></td>
            </tr>
            <tr>
                <td>
                    <asp:Label ID="Label1" runat="server" Text="Gmail ID :"></asp:Label>
                </td>
                <td>
                    <asp:TextBox ID="txt_email" runat="server" Width="241px"></asp:TextBox>
                </td>
                <td>
                    <asp:RegularExpressionValidator ID="RegularExpressionValidator1" runat="server" 
                        ControlToValidate="txt_email" ErrorMessage="Invalid Mail Format" 
                        ValidationExpression="\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*"></asp:RegularExpressionValidator>
                </td>
            </tr>
            <tr>
                <td>
                    <asp:Label ID="Label2" runat="server" Text="Password :"></asp:Label>
                </td>
                <td>
                    <asp:TextBox ID="txt_password" runat="server" TextMode="Password" Width="239px"></asp:TextBox>
                </td>
                <td>
                    <asp:RequiredFieldValidator ID="RequiredFieldValidator1" runat="server" 
                        ControlToValidate="txt_password" ErrorMessage="*"></asp:RequiredFieldValidator>
                </td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: center">
                    <asp:Button ID="Button1" runat="server" CausesValidation="False" 
                        onclick="Button1_Click" style="text-align: center" Text="Login" Width="72px" />
                </td>
            </tr>
        </table>
    
    </div>
    </form>
</body>
</html>
